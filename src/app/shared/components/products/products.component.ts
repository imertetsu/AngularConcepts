import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { Product, CreateProductDTO, UpdateProductDTO } from '../../../models/product.model';
import { StoreService } from 'src/app/services/store.service';
import { ProductsService } from 'src/app/services/products.service';

import { switchMap, zip } from 'rxjs';
import { FormControl } from '@angular/forms';

import SwiperCore, { SwiperOptions, Navigation, Pagination, Scrollbar, A11y } from 'swiper';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit{

  config: SwiperOptions = {
    slidesPerView: 1,
    navigation: true,
    pagination: { clickable: true },
    scrollbar: { draggable: true },
  };

  productFound = new FormControl('');
  productsF: Product[]= [];

  totalPrice = 0;
  myProductsInCart: Product[] = [];
  @Input() products: Product[] = [];
  productChosen!: Product;
  showProduct = false;
  productId!: number;
  @Input()
  //para vigilar continuamente el cambio de este input
  set idProduct(id: number){
    if(id){
      this.onListeningProductId(id);
    }
  }

  constructor(private storeService: StoreService, private productsService:ProductsService){
    this.myProductsInCart = this.storeService.getProductsInCart();
  }

  ngOnInit(): void {
    this.findProductsByName();
  }


  /*Este metodo escucha lo que viene a ser el producto al presionar el boton "Add Cart"*/
  onListenProduct(product:Product){
    console.log("El producto es: ",product);
    this.onAddtoShoppingCart(product);
    console.log("precio total a pagar: $"+this.totalPrice);
    console.log("Los productos seleccionados son: ", this.myProductsInCart);
    //console.log("instancia storeService "+ JSON.stringify(this.storeService));
  }
  onAddtoShoppingCart(product:Product){
    this.storeService.addProductToCart(product);
    this.totalPrice = this.storeService.sumTotalPrice(product.price);
  }
  addtoShoppingCart(){
    this.storeService.addProductToCart(this.productChosen);
    this.totalPrice = this.storeService.sumTotalPrice(this.productChosen.price);
  }

  onLoaded(img:string){
    console.log('esta llegando al componente products', img);
  }

  displayShowProduct(){
    this.showProduct = !this.showProduct;
    console.log(this.showProduct);
  }

  onListeningProductId(productId: number){
    this.displayShowProduct();
    this.productId = productId;
    this.productsService.getProduct(productId).subscribe((data)=>{
      console.log(data);
      this.productChosen = data;
    },(error) => {
      console.error(error);
    });
  }

  createNewProduct() {
    const product: CreateProductDTO = {
      name: 'Nuevo prodcuto',
      description: 'bla bla bla',
      images: [`https://placeimg.com/640/480/any?random=${Math.random()}`],
      price: 456,
      categoryId: 2,
    }
    this.productsService.createProduct(product)
    .subscribe(data => {
      this.products.unshift(data);
    });
  }
  updateProduct() {
    const changes: UpdateProductDTO = {
      name: 'change title',
    }
    const id = this.productChosen.id;
    this.productsService.updateProduct(id, changes)
    .subscribe(data => {
      const productIndex = this.products.findIndex(item => item.id === this.productChosen.id);
      this.products[productIndex] = data;
      this.productChosen = data;
    });
  }
  deleteProduct(){
    const id = this.productChosen.id;
    this.productsService.deleteProduct(id).subscribe(() => {
      const productIndex = this.products.findIndex(product => product.id === this.productChosen.id);
      this.products = this.products.splice(productIndex, 1);
      this.displayShowProduct();
    }, error =>{
      console.log(error);
    });
  }

  //Example como usar switchMap es como que necesitas el id del producto para actualizar, dependencias
  readAndUpdate(id:number){
    this.productsService.getProduct(id)
    .pipe(
      switchMap(product => this.productsService.updateProduct(product.id, {name: 'changed'}))
    )
    .subscribe(data =>{
      console.log(data);
    });

    //en caso de no existir dependencia pero se necesita ejecutar mas de una operdacion asincrona utilizamos ZIP
    //Es como el promise ALL pero en rxjs
    zip(
      this.productsService.getProduct(id),
      this.productsService.updateProduct(id, {name: 'changed'})
    )
    .subscribe(response => {
      const product = response[0];
      const updated = response[1];
    });
  }

  findProductsByName(){
    this.productFound.valueChanges
    .subscribe(value => {
      const regex = new RegExp(`${value}`, 'i');
      const pf = this.products.filter(product => regex.test(product.name));
      console.log('filtrados:', pf);
      if(pf){
        this.productsF = pf;
      }else{
        this.productsF = [];
      }
    });
  }
}

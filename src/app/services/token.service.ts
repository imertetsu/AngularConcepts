import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {


  saveToken(token: string){
    localStorage.setItem('token', token);
    sessionStorage.setItem('token', token);
  }

  getToken(){
    const token = localStorage.getItem('token');
    return token;
  }

  removeToken(){
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
}

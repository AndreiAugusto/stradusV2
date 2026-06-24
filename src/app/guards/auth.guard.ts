import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  if (localStorage.getItem('accessToken')) return true;
  inject(Router).navigate(['/']);
  return false;
};

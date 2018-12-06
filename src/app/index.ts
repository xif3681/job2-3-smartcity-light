import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { InterceptorService } from './interceptorService';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
];
/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
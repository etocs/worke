export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const originalHost = url.hostname;
    const path = url.pathname + url.search;

    if (!path.startsWith("/books-files/")) {
      url.hostname = 'zh.singlelogin.re';
    }
    
    let response = await fetch(url, request);
    
    let location = response.headers.get('Location');
    if (location) {
      const locationUrl = new URL(location);
      if (!locationUrl.pathname.startsWith("/books-files/")) {
        locationUrl.hostname = originalHost;
      }
      response = new Response(response.body, response);
      response.headers.set('Location', locationUrl.toString());
    }
    
    let cookieHeaders = response.headers.get('Set-Cookie');
    if (cookieHeaders) {
      let cookies = cookieHeaders.split(',').map(cookie => cookie.trim());
      response = new Response(response.body, response);
      response.headers.delete('Set-Cookie');
      
      cookies.forEach(cookie => {
        let modifiedCookie = cookie.replace(/(domain=)([^;]+)(;|$)/gi, `$1${originalHost}$3`);
        response.headers.append('Set-Cookie', modifiedCookie);
      });
    }
    
    return response;
  }
}

const genCookies = (cookieStr) => {
  let cookieArray = [];
  if (typeof cookieStr === 'string' && cookieStr.length > 0) {
    cookieArray = cookieStr.split('; ').map(cookieItem => {
      const [name, value] = cookieItem.split('=');
      return { name, value, domain: '.xdf.cn' };
    });
  } else if (Array.isArray(cookieStr)) {
    cookieArray = cookieStr;
  }
  return cookieArray;
}
module.exports = {
  genCookies
}
const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : " https://pradyumna-poirot-app.herokuapp.com";
export default baseUrl;

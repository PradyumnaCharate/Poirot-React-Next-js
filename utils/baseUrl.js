const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : " https://pradyumna-poirot.netlify.app";
export default baseUrl;

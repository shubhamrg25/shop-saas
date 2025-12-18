// Base URL (change once if backend moves)
export const BASE_URL = "http://127.0.0.1:8000/api";

/* ===============================
   AUTH
================================ */
export const LOGIN_URL = `${BASE_URL}/token/`;
export const REFRESH_TOKEN_URL = `${BASE_URL}/token/refresh/`;

/* ===============================
   PRODUCTS
================================ */
export const PRODUCTS_URL = `${BASE_URL}/products/`;

/* ===============================
   BILLING
================================ */
export const CREATE_BILL_URL = `${BASE_URL}/bill/`;
export const BILL_DETAIL_URL = (billId) =>
  `${BASE_URL}/bill/${billId}/`;

export const PAY_BILL_DUE_URL = (billId) =>
  `${BASE_URL}/bill/${billId}/pay/`;

/* ===============================
   BILL HISTORY
================================ */
export const BILL_HISTORY_URL = (search = "", page = 1) =>
  `${BASE_URL}/bills/?search=${search}&page=${page}`;

/* ===============================
   DASHBOARD
================================ */
export const DASHBOARD_URL = `${BASE_URL}/dashboard/`;

/* ===============================
   CUSTOMERS / LEDGER
================================ */
export const CUSTOMERS_URL = (search = "") =>
  `${BASE_URL}/customers/?search=${search}`;

export const CUSTOMER_STATEMENT_URL = (customerId) =>
  `${BASE_URL}/customers/${customerId}/statement/`;

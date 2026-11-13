import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import "./style.css";

import App from "./App";
import { store } from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
        <BrowserRouter>
            <App />
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 2500,
                    style: {
                        borderRadius: "14px",
                        fontWeight: 600,
                    },
                }}
            />
        </BrowserRouter>
    </Provider>
</React.StrictMode>
);
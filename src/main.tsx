import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import "mantine-contextmenu/styles.css";
import { MantineProvider } from "@mantine/core";
import { ContextMenuProvider } from "mantine-contextmenu";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <MantineProvider defaultColorScheme="dark">
    <ContextMenuProvider>
      <App />
    </ContextMenuProvider>
  </MantineProvider>,
);

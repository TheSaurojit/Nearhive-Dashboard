import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import QueryProvider from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";

function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthProvider>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
      </AuthProvider>
    </>
  );
}

export default Providers;

declare module 'react-dom/client' {
  import { Container } from 'react-dom';
  export function createRoot(container: Container): {
    render(children: React.ReactNode): void;
  };
}

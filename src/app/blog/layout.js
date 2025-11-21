// app/blog/layout.js
import { StoreProvider } from '../../context/StoreContext';

export default function BlogLayout({ children }) {
    return (
        <StoreProvider>
            <div className="min-h-screen bg-gray-50">
                <main>
                    {children}
                </main>
            </div>
        </StoreProvider>
    );
}
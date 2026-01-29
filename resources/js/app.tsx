import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AlertProvider } from "@/components/alert/AlertProvider";

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob('./pages/**/*.tsx')
    ),

  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <>
        {/* GLOBAL TOASTER */}
        <Toaster position='top-right' />
        <AlertProvider>

        {/* INERTIA APP */}
        <App {...props} />
        </AlertProvider>
      </>
    );
  },

  progress: {
    color: '#4B5563',
  },
});
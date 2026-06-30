import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about-us.html'),
        contact: resolve(__dirname, 'contact.html'),
        blog: resolve(__dirname, 'blog.html'),
        caseStudies: resolve(__dirname, 'case-studies.html'),
        privacy: resolve(__dirname, 'legal-pages/privacy-policy.html'),
        notfound: resolve(__dirname, '404.html'),

        // Case Studies Detail Pages
        dentalClinic: resolve(__dirname, 'case-studies/dental-clinic-voice-receptionist.html'),
        realEstate: resolve(__dirname, 'case-studies/real-estate-lead-automation.html'),
        ecommerceSupport: resolve(__dirname, 'case-studies/ecommerce-support-assistant.html'),

        // Single Blog Pages
        blogStrategy: resolve(__dirname, 'blog/how-ai-is-redefining-business-strategy.html'),
        blogWorkflows: resolve(__dirname, 'blog/automating-workflows-the-smart-way-forward.html')
      }
    }
  }
});

Server Integration
------------------

The Belle II event display web application is built using the Angular CLI. To integrate the app with the Apache server, follow these steps.

1. **Build the App:**
   Run the following command from the project directory to build the app:

   .. code-block:: console

      $ npm run build

   This command generates optimized production-ready files in the ``dist`` directory. Move this folder to a suitable location for easier server integration.

2. **Configure Apache Server:**
   Configure your Apache server to serve the app's files. Edit your Apache configuration file and add the following block:

   .. code-block:: apache

      <VirtualHost *:80>
          ServerName yourdomain.com
          DocumentRoot /path_to_app/dist

          <Directory /path_to_app/dist>
              Options Indexes FollowSymLinks
              AllowOverride All
              Require all granted
          </Directory>
      </VirtualHost>

   Replace ``yourdomain.com`` with your actual domain name and ``/path_to_app/dist`` with the actual path to the Belle II app's ``dist`` directory.

3. **Enable mod_rewrite for Routing:**
   Add the following lines to your server configuration to enable mod_rewrite for routing:

   .. code-block:: apache

      <IfModule mod_rewrite.c>
          RewriteEngine On
          RewriteBase /
          RewriteRule ^index\.html$ - [L]
          RewriteCond %{REQUEST_FILENAME} !-f
          RewriteCond %{REQUEST_FILENAME} !-d
          RewriteRule . /index.html [L]
      </IfModule>

4. **Restart Apache:**
   Apply the configuration updates by restarting the Apache server. On a Linux-based system, use the following command:

   .. code-block:: console

      $ sudo service apache2 restart
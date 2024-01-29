.. _developer_installation:

Installation
============

For developers, to set up the local environment, please follow the steps below.

1. Install **Node.js** on your system. You can download the latest version of Node.js from the
   `official website`_.

   Note that the recommended version of Angular CLI (see below) requires a minimum Node.js version
   of v16.30, v18.10 or v20.0.

.. _official website: https://nodejs.org/en/download


2. Install **Angular CLI** globally:
   
   .. code-block:: console

      $ npm install -g @angular/cli@15.2.7

3. Clone the Git repository:
   
   .. code-block:: console

      $ git clone git@github.com:belle2/display.git

4. Change the current directory into the cloned folder.

   .. code-block:: console

      $ cd display

5. Install the necessary dependencies:

   .. code-block:: console

      $ npm ci

6. Start the development server:

   .. code-block:: console

      $ npm start

7. Navigate to ``http://localhost:4200/`` in your web browser to view the application. In case the
   port ``4200`` is already used by other services, the application reports which port to use via
   log message.

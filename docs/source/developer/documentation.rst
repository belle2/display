Building the Documentation
==========================

To build this documentation and view it, please follow the steps below.

1. Create a Python virtual environment:

   .. code-block:: console

      $ python3 -m venv display-env

2. Activate the virtual environment:

   .. code-block:: console

      $ source display-env/bin/activate

3. Install **Sphinx** and all the other required packages:

   .. code-block:: console

      $ pip3 install -r requirements-docs.txt

4. Build the documentation:

   .. code-block:: console

      $ sphinx-build docs/source/ docs/build

5. Open the documentatio with your web browser. The entry point to the documentation is
   ``docs/build/index.html``.

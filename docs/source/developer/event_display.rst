Event Display
=============

This documentation assumes you already possess a basic understanding of Phoenix and how to utilize it.

Customized Event Objects
------------------------

Within the Belle II event display, four types of objects are presented: Tracks, MCParticles, ECLClusters, and KLMClusters. While Phoenix's existing design represents Tracks, the others are directly rendered using ThreeJS. This approach ensures seamless visualization alignment with the context of Belle II.

To create customized event objects (e.g., Hits), please refer to the Phoenix `event-data-loader`_ documentation. The custom object files within the Belle II display repository are stored in the ``display/src/loaders/objects/`` folder. You can adjust the visualization characteristics (thickness, default color, etc.) of objects using ThreeJS framework syntax.

.. _event-data-loader: https://github.com/HSF/phoenix/blob/main/guides/developers/event-data-loader.md

Once you've created a customized object, you need to add it to the ``Belle2Loader`` in the ``display/src/loaders/event-data-loader.ts`` file to enable its display. For more information, also refer to the Phoenix `event-data-loader`_ documentation.

Additionally, Phoenix offers some `default objects`_ in its codebase. If they meet your requirements, you can integrate these objects into your display.

.. _default objects: https://github.com/HSF/phoenix/blob/main/guides/developers/event_data_format.md

UI Modification
---------------

The frontend of the Belle II display web application is built on the Angular framework. Therefore, to modify the user interface for this project, Angular knowledge is required.

By default, the components for the web application are stored in the ``display/src/app/`` folder.

| display/src/app/
| ├── home
| │   ├── ...
| │   └── ...
| ├── event-display
| │   ├── ...
| │   └── ...
| ├── detector
| │   ├── ...
| │   └── ...
| ├── customized-components
| │   ├── ...
| │   └── ...
| └── ...

Essentially, three main pages exist: the homepage, event display, and detector display, corresponding to the ``home/``, ``event-display/``, and ``detector/`` folders respectively in the ``display/src/app/`` folder. Additionally, the ``customized-components`` folder contains all customized Phoenix components.

As this project is built on Phoenix, most UI components used here are obtained from ``phoenix-ui-components``, such as **Display Options** or the tools in the **UI Menu**. However, due to the unique characteristics of the Belle II event display, some tools (e.g., event selector, event import/export) need customization. To create customized components, it is essential to study existing Phoenix UI components and their usage. This is necessary because, when developing new components, you will need to seamlessly integrate them into the web framework built on Phoenix. In short, skills in handling both Angular and Phoenix are required.


Framework and Tools
===================

Phoenix
-------

The Belle II Event Display with Phoenix application is built based on Phoenix, a TypeScript-based event display framework. If you are starting to contribute to or modify the event display, it is strongly recommended to familiarize yourself with the Phoenix framework and how to use it.

You can access the Phoenix documentation by following this `link`_. Additionally, developers can find more `specialized guidance`_ available.

.. _link: https://github.com/HSF/phoenix/blob/main/README.md

.. _specialized guidance: https://github.com/HSF/phoenix/tree/main/guides/developers#readme


JSROOT
------

Currently, the mdst data is stored in the *.root* file. To utilize the Phoenix framework and display the event in the browser, it is required to extract the data from the *.root* file and convert it into the form of a TypeScript object. For this task, JSRoot is used.

You can find information on how to use JSRoot in its `documentation`_.

.. _documentation: https://github.com/root-project/jsroot/blob/master/docs/JSROOT.md

In this project, you can see the application of JSRoot in the file `event-loader.ts`_ for extracting event information from the mdst *.root* file.

.. _event-loader.ts: https://github.com/belle2/display/blob/main/src/app/event-display/event-loader.ts

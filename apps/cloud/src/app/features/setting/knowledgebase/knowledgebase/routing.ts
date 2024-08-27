import { Routes } from '@angular/router'
import { KnowledgeDocumentsComponent } from './documents/documents.component'
import { KnowledgebaseComponent } from './knowledgebase.component'
import { KnowledgeConfigurationComponent } from './configuration/configuration.component'
import { KnowledgeTestComponent } from './test/test.component'

export default [
  {
    path: '',
    component: KnowledgebaseComponent,
    data: {
      title: 'Settings / Knowledgebase'
    },
    children: [
      {
        path: '',
        redirectTo: 'documents',
        pathMatch: 'full'
      },
      {
        path: 'documents',
        component: KnowledgeDocumentsComponent
      },
      {
        path: 'configuration',
        component: KnowledgeConfigurationComponent
      },
      {
        path: 'test',
        component: KnowledgeTestComponent
      }
    ]
  }
] as Routes

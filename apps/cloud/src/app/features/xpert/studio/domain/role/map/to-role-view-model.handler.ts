// import { IHandler } from '@foblex/mediator'
// import { IXpertRole } from 'apps/cloud/src/app/@core'
// import { IRoleViewModel } from '../i-role-view-model'

// export class ToRoleViewModelHandler implements IHandler<void, IRoleViewModel[]> {

//   public handle(): IRoleViewModel[] {
//     // return [...(this.storage.roles ?? []), this.storage.team, ...handleRoles(this.storage.team)].map((x) => {
//     //   return {
//     //     ...x,
//     //     key: x.key ?? x.id,
//     //     position: x.options?.position
//     //   }
//     // })
//     return null
//   }
// }

// function handleRoles(role: IXpertRole) {
//   const roles = []
//   for (const member of role.members ?? []) {
//     roles.push(member)
//     if (member.members) {
//       roles.push(...handleRoles(member))
//     }
//   }
//   return roles
// }

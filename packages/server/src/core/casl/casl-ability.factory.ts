import { AbilityBuilder, Ability, ExtractSubjectType, AbilityClass, InferSubjects } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Organization, User } from '../entities/internal';
import { Action } from './action';


type Subjects = InferSubjects<typeof Organization | typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all'); // read-only access to everything
    }

    can(Action.Update, Organization, { createdById: user.id });
    cannot(Action.Delete, Organization, { isActive: true });

    return build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>
    });
  }
}
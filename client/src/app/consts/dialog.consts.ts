import { Component } from '@angular/core';
import { OrganizerCorrectionComponent } from '@app/components/correction/organizer-correction/organizer-correction.component';
import { PlayerCorrectionComponent } from '@app/components/correction/player-correction/player-correction.component';
import { IntermissionComponent } from '@app/components/intermission/intermission.component';
import { LoadingComponent } from '@app/components/loading/loading.component';

export const DIALOG_OPTIONS = {
    disableClose: true,
};

export const SNACK_BAR_DEFAULT_DURATION = 1500;

export type DialogComponent = Component | LoadingComponent | OrganizerCorrectionComponent | PlayerCorrectionComponent | IntermissionComponent;

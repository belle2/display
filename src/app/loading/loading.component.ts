import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
    // Define the inputs for the component
    @Input() loaded = false;
    @Input() progress: number = 0;
}

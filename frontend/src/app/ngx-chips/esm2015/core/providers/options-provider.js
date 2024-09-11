import { defaults } from '../../defaults';
export class OptionsProvider {
    setOptions(options) {
        OptionsProvider.defaults.tagInput = Object.assign({}, defaults.tagInput, options.tagInput);
        OptionsProvider.defaults.dropdown = Object.assign({}, defaults.dropdown, options.dropdown);
    }
}
OptionsProvider.defaults = defaults;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC1jaGlwcy8iLCJzb3VyY2VzIjpbImNvcmUvcHJvdmlkZXJzL29wdGlvbnMtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBNEMsTUFBTSxnQkFBZ0IsQ0FBQztBQVdwRixNQUFNLE9BQU8sZUFBZTtJQUdqQixVQUFVLENBQUMsT0FBZ0I7UUFDOUIsZUFBZSxDQUFDLFFBQVEsQ0FBQyxRQUFRLHFCQUFPLFFBQVEsQ0FBQyxRQUFRLEVBQUssT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hGLGVBQWUsQ0FBQyxRQUFRLENBQUMsUUFBUSxxQkFBTyxRQUFRLENBQUMsUUFBUSxFQUFLLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwRixDQUFDOztBQUxhLHdCQUFRLEdBQUcsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmYXVsdHMsIFRhZ0lucHV0T3B0aW9ucywgVGFnSW5wdXREcm9wZG93bk9wdGlvbnMgfSBmcm9tICcuLi8uLi9kZWZhdWx0cyc7XG5cbmV4cG9ydCB0eXBlIE9wdGlvbnMgPSB7XG4gICAgdGFnSW5wdXQ/OiB7XG4gICAgICAgIFtQIGluIGtleW9mIFRhZ0lucHV0T3B0aW9uc10/OiBUYWdJbnB1dE9wdGlvbnNbUF07XG4gICAgfTtcbiAgICBkcm9wZG93bj86IHtcbiAgICAgICAgW1AgaW4ga2V5b2YgVGFnSW5wdXREcm9wZG93bk9wdGlvbnNdPzogVGFnSW5wdXREcm9wZG93bk9wdGlvbnNbUF07XG4gICAgfVxufTtcblxuZXhwb3J0IGNsYXNzIE9wdGlvbnNQcm92aWRlciB7XG4gICAgcHVibGljIHN0YXRpYyBkZWZhdWx0cyA9IGRlZmF1bHRzO1xuXG4gICAgcHVibGljIHNldE9wdGlvbnMob3B0aW9uczogT3B0aW9ucyk6IHZvaWQge1xuICAgICAgICBPcHRpb25zUHJvdmlkZXIuZGVmYXVsdHMudGFnSW5wdXQgPSB7Li4uZGVmYXVsdHMudGFnSW5wdXQsIC4uLm9wdGlvbnMudGFnSW5wdXR9O1xuICAgICAgICBPcHRpb25zUHJvdmlkZXIuZGVmYXVsdHMuZHJvcGRvd24gPSB7Li4uZGVmYXVsdHMuZHJvcGRvd24sIC4uLm9wdGlvbnMuZHJvcGRvd259O1xuICAgIH1cbn1cblxuZXhwb3J0IHsgVGFnSW5wdXREcm9wZG93bk9wdGlvbnMsIFRhZ0lucHV0T3B0aW9ucyB9O1xuIl19
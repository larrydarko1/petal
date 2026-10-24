import { stylelint } from '@larrydarko/lint-config/stylelint';

// `spacingUnit: 'rem'` — where Petal departs from the shared `em`, for slate's reason: the
// toolbar runs at 11.5–12px, so `em` would shrink each control's padding with its label and
// pull it out of step with the rest of the chrome. `rem` keeps one anchor for the whole app
// and still scales with the user's font-size preference.
// `variablesOverride`: _variables.scss declares the `$color-*` aliases over custom properties
// that _theme.scss generates in a loop, which no static analyser can follow.
export default stylelint({
    spacingUnit: 'rem',
    lowercaseCurrentColor: true,
    variablesOverride: true,
});

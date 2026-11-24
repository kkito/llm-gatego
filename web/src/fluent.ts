// Pruned Fluent web component registration.
//
// Do NOT import the package root or call provideFluentDesignSystem(): that
// pulls in the entire component catalog. Each `define.js` module registers
// exactly one custom element, keeping the admin bundle small and predictable.
import '@fluentui/web-components/button/define.js'
import '@fluentui/web-components/anchor-button/define.js'
import '@fluentui/web-components/badge/define.js'
import '@fluentui/web-components/divider/define.js'
import '@fluentui/web-components/message-bar/define.js'

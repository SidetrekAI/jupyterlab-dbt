import { ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application'
import { ISettingRegistry } from '@jupyterlab/settingregistry'
import { ICommandPalette, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils'
import { ILauncher } from '@jupyterlab/launcher'
import { LabIcon } from '@jupyterlab/ui-components'

import { DbtWidget } from './widget'
import dbtLogoSvg from '../style/images/dbt_logo.svg'

// Set up an icon for the launcher
export const dbtIcon = new LabIcon({
  name: 'barpkg:foo',
  svgstr: dbtLogoSvg,
})

/**
 * Initialization data for the jupyterlab-dbt extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-dbt:plugin',
  description: 'A JupyterLab extension for DBT.',
  autoStart: true,
  requires: [ICommandPalette],
  optional: [ISettingRegistry, ILauncher, ILayoutRestorer],
  // CAVEAT: order of arguments is important
  activate: async (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    settingRegistry: ISettingRegistry | null,
    launcher: ILauncher,
    restorer: ILayoutRestorer | null
  ) => {
    console.log('JupyterLab extension jupyterlab-dbt is activated!')

    // Define a widget creator function,
    // then call it to make a new widget
    const newWidget = async () => {
      // Create a blank content widget inside of a MainAreaWidget
      const content = new DbtWidget()
      const widget = new MainAreaWidget<DbtWidget>({ content })
      widget.id = 'dbt-jupyterlab'
      widget.title.label = 'DBT Model'
      widget.title.closable = true
      return widget
    }
    let widget = await newWidget()

    // Add an application command
    const command: string = 'dbt:open'
    app.commands.addCommand(command, {
      caption: 'View and run DBT models',
      label: 'DBT Model',
      icon: (args) => dbtIcon,
      execute: async () => {
        // Regenerate the widget if disposed
        if (!widget || widget.isDisposed) {
          widget = await newWidget()
        }

        // Track the state of the widget for later restoration
        if (!tracker.has(widget)) {
          tracker.add(widget)
        }

        // Attach the widget to the main work area if it's not there
        if (!widget.isAttached) {
          app.shell.add(widget, 'main')
        }

        // Activate the widget
        app.shell.activateById(widget.id)
      },
    })

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then((settings) => {
          console.log('jupyterlab-dbt settings loaded:', settings.composite)
        })
        .catch((reason) => {
          console.error('Failed to load settings for jupyterlab-dbt.', reason)
        })
    }

    // Add the command to the palette.
    palette.addItem({ command, category: 'Tutorial' })

    if (launcher) {
      launcher.add({ command })
    }

    // Track and restore the widget state
    let tracker = new WidgetTracker<MainAreaWidget<DbtWidget>>({ namespace: 'dbt' })
    if (restorer) {
      restorer.restore(tracker, { command, name: () => 'dbt' })
    }
  },
}

export default plugin

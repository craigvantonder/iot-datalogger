<script setup lang="ts">
import { reactive, ref, computed, inject, toRaw, nextTick, onMounted, onUnmounted } from 'vue'
import debounce from 'lodash.debounce'
import Config from '../api/config'
import Device from '../api/device'
import type { Ref } from 'vue'
import type { IConfig, IDevice } from '../lib/interfaces'

const socket: WebSocket = inject('socket')! // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator

// Utility for displaying the messages
interface IToast { show: (msg: string, style?: string) => void }
const toast: Ref<IToast | null> = inject('toast')!

// Form attribute configuration
const isProcessingForm = ref(false)
const minSeconds = 5
const maxSeconds = 295
const stepSeconds = 5
interface ReadingInterval {
  label: string,
  val: string
}
const readingIntervals = <Ref<ReadingInterval[]>>ref([{
  label: 'Manual input',
  val: 'sec'
},{
  label: '5 Minutes',
  val: '5m'
},{
  label: '15 Minutes',
  val: '15m'
},{
  label: '30 Minutes',
  val: '30m'
},{
  label: '1 Hour',
  val: '1h'
},{
  label: '1 Day',
  val: '1d'
}])!
const intervalOptions = computed(() => readingIntervals.value.map(i => i.val))

const baseConfig = {
  readingInterval: 'sec',
  manualReadingInterval: 30,
  userLed: false
}

// Existing config (in the database)
const config: IConfig = reactive({ ...baseConfig })

// Current config (in the ui)
const form: IConfig = reactive({ ...baseConfig })

// Utility function to check if the existing config have been modified
const formValuesChanged = computed(function(): boolean {
  return form.readingInterval !== config.readingInterval ||
         form.manualReadingInterval !== config.manualReadingInterval ||
         form.userLed !== config.userLed
})

// Executes when the save button is clicked
async function saveForm(): Promise<void> {
  //isProcessingForm.value = true
  if (!formValuesChanged.value) return
  await Config.updateDeviceConfig({
    deviceId: selectedDeviceId.value,
    ...toRaw(form)
  })
  Object.assign(config, form)
  toast.value?.show('Device configuration updated')
  //isProcessingForm.value = false
}
function readingIntervalOptionLabel(option: string): string {
  const interval = readingIntervals.value.find(interval => interval.val === option)
  if (interval === undefined) return 'Interval not found'
  return interval.label
}
function isSelectableReadingInterval(option: string): boolean {
  return form.readingInterval !== option
}
function changeReadingInterval(option: string): void {
  // Wait for the value to be updated before attempting server submission
  nextTick(async () => {
    // Get the current config
    const dbConfig = await Device.config(selectedDeviceId.value)
    // Store the existing config for detection of changes
    config.manualReadingInterval = dbConfig.manualReadingInterval
    form.manualReadingInterval = dbConfig.manualReadingInterval
    // Save the form details
    saveForm()
  })
}
function changeManualReadingInterval(event: Event): void {
  // The range output is a string, cast it to an integer
  form.manualReadingInterval = parseInt((event.target as HTMLInputElement).value, 10)
  saveForm()
}

function toggleUserLed(): void {
  form.userLed = !form.userLed
  saveForm()
}

// Helper function to get the devices
const devices = <Ref<IDevice[]>>ref([])
async function getDevices(): Promise<void> {
  const foundDevices = await Device.find()
  devices.value = foundDevices
  if (foundDevices.length > 0) selectDevice(foundDevices[0].id)
}

// Helper function to highlight the selected row
function calcRowClass(id?: number): string {
  let output = 'align-middle'
  if (selectedDeviceId.value === id) output += ' table-info'
  return output
}

// Reduce API requests
const updateDeviceName = debounce(async function(event: Event, id: number) {
  //isProcessingForm.value = true
  const deviceIndex = devices.value.findIndex(d => d.id === id)
  if (deviceIndex === -1) return
  const device = devices.value[deviceIndex]
  const name = (event.target as HTMLInputElement).value
  if (device.name === name) return
  await Device.update({ id, name } as IDevice)
  device.name = name
  toast.value?.show('Device name updated')
  //isProcessingForm.value = false
}, 300)

// Handle row selection device
const selectedDeviceId = <Ref<number | null>>ref(null)!
const isDeviceSelected = computed(() => selectedDeviceId.value !== null)
async function selectDevice(deviceId: number): Promise<void> {
  selectedDeviceId.value = deviceId
  // Get the current config
  const dbConfig = await Device.config(deviceId)
  // Store the existing config for detection of changes
  Object.assign(config, dbConfig)
  // Store the form values for user modification
  Object.assign(form, dbConfig)
}

//  ┬ ┬┌─┐┌┐ ┌─┐┌─┐┌─┐┬┌─┌─┐┌┬┐
//  │││├┤ ├┴┐└─┐│ ││  ├┴┐├┤  │
//  └┴┘└─┘└─┘└─┘└─┘└─┘┴ ┴└─┘ ┴

// Listen when device connects and push data to the view
async function handleMessage(msg: MessageEvent) {
  // Parse the message values
  const { channel, message } = <{ channel: string, message: IDevice }>JSON.parse(msg.data)
  // Handle device messages
  if (channel === 'device') {
    // Add the device to the end of the table
    devices.value.push(message)
    // Automatically select the first device
    if (isDeviceSelected.value) return
    selectDevice(message.id)
    // No further processing
    return
  }
}

// When user enters the view
onMounted(async function (): Promise<void> {
  // Fetch existing data initially
  await getDevices()
  // Request to receive new messages
  socket.send(JSON.stringify({ action: 'subscribe', channel: 'device' }))
  // Handle the new messages
  socket.onmessage = (event: MessageEvent) => handleMessage(event)
})

// Executes when the component has been mounted in the DOM
onUnmounted(function(): void {
  if (!socket) return
  // Request that new messages are no longer sent
  socket.send(JSON.stringify({ action: 'unsubscribe', channel: 'device' }))
  // Remove the event handler
  socket.onmessage = null
})
</script>

<template>
  <div class="row">
    <div class="col">
      <h4>Device config</h4>
      <p v-if="!isDeviceSelected">Select a device to configure it.</p>
      <form v-else>
        <fieldset class="row mb-3">
          <legend class="col-form-label col-sm-3 pt-0">Reading Interval</legend>
          <div class="col-sm-9">
            <v-select
              title="Adjust the delay between readings"
              placeholder="Select an interval period"
              v-model="form.readingInterval"
              :options="intervalOptions"
              :getOptionLabel="readingIntervalOptionLabel"
              :selectable="isSelectableReadingInterval"
              @option:selecting="changeReadingInterval"
              :disabled="isProcessingForm"
              :clearable="false"
            />
          </div>
        </fieldset>

        <fieldset class="row mb-3" v-if="form.readingInterval === 'sec'">
          <legend class="col-form-label col-sm-3 pt-0">Manual Interval ({{ form.manualReadingInterval }} secs)</legend>
          <div class="col-sm-9">
            <input type="range" class="form-range" id="rangeReadingInterval"
                   :min="minSeconds" :max="maxSeconds" :step="stepSeconds" :value="form.manualReadingInterval" :disabled="isProcessingForm" @change="changeManualReadingInterval">
          </div>
        </fieldset>

        <fieldset class="row mb-3">
          <legend class="col-form-label col-sm-3 pt-0">User LED (Blue)</legend>
          <div class="col-sm-9">
            <div class="form-check form-switch">
              <input type="checkbox" role="switch" class="form-check-input" id="led1" :disabled="isProcessingForm" :checked="form.userLed" @change="toggleUserLed">
              <label class="form-check-label" for="led1">{{ form.userLed ? 'On' : 'Off' }}</label>
            </div>
          </div>
        </fieldset>
      </form>

      <hr />

      <h4>All devices</h4>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">CHIP ID</th>
              <th scope="col">MODEL</th>
              <th scope="col">REVISION</th>
              <th scope="col">CORES</th>
              <th scope="col">MAC ADDRESS</th>
              <th scope="col">NAME</th>
              <th class="d-flex justify-content-end" scope="col">OPTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr :class="calcRowClass(device.id)" v-for="device in devices" :key="device.id">
              <th scope="row">{{ device.chipId }}</th>
              <td>{{ device.chipModel }}</td>
              <td>Rev. {{ device.chipRevision }}</td>
              <td>{{ device.chipCores }}</td>
              <td>{{ device.macAddress }}</td>
              <td>
                <input type="text" class="form-control form-control-sm" placeholder="Enter a name" minlength="1" maxlength="255" :disabled="isProcessingForm" :value="device.name" @input="updateDeviceName($event, device.id)" />
              </td>
              <td class="d-flex justify-content-end">
                <button type="button" class="btn btn-sm btn-outline-primary" @click="selectDevice(device.id)" :disabled="selectedDeviceId === device.id">Configure</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
h4, button {
  font-family: 'open_sanssemibold';
}
</style>
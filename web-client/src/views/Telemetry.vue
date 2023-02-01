<script setup lang="ts">
import { ref, reactive, computed, watch, inject, nextTick, toRaw, onMounted, onUnmounted } from 'vue'
import Device from '../api/device'
import Telemetry from '../api/telemetry'
import type { Ref } from 'vue'
import type { IDevice, ITelemetry, ITelemetryFormPayload } from '../lib/interfaces'

const socket: WebSocket = inject('socket')! // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator

//  ┌─┐┌─┐┬─┐┌┬┐
//  ├┤ │ │├┬┘│││
//  └  └─┘┴└─┴ ┴
const isProcessingForm = ref(false)
const form: ITelemetryFormPayload = reactive({
  devices: [],
  date: {
    from: null,
    to: null,
  },
  page: {
    number: 1,
    size: 100
  }
})

//  ┌┬┐┌─┐┌┐ ┬  ┌─┐
//   │ ├─┤├┴┐│  ├┤
//   ┴ ┴ ┴└─┘┴─┘└─┘
const highlightTimeout = 5000
// Wait for the value to be updated before attempting server submission
const getData = (): Promise<void> => nextTick(async function () {
  const payload = toRaw(form)
  payload.devices = payload.devices.map((d: IDevice) => toRaw(d))
  const { total, telemetry } = await Telemetry.page(payload)
  if (total > 0){
    data.value = telemetry
    totalPages.value = Math.ceil(total / payload.page.size)
    pageOptions.value = Array.from({ length: totalPages.value }, (_, i) => i+1) // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#sequence_generator_range
  }
})
let data: Ref<ITelemetry[]> = ref([])
const totalRecords = computed((): number => data.value.length)
const highlightedRecords: Ref<number[]> = ref([])
const highlightTimeouts: Ref<NodeJS.Timeout[]> = ref([])
async function getDevices(): Promise<void> {
  devices.value = await Device.find()
}
function calcTableRowClass(id?: number): string {
  let output = 'align-middle'
  if (id && highlightedRecords.value.includes(id)) output += ' table-info'
  return output
}
function getDeviceName(deviceId?: number): string {
  const device = devices.value.find(device => device.id === deviceId)
  if (device === undefined) return 'Device not found'
  return device.name
}
function getChipId(deviceId?: number): string {
  const device = devices.value.find(device => device.id === deviceId)
  if (device === undefined) return 'Device not found'
  return device.chipId.toString()
}
function getMacAddress(deviceId?: number): string {
  const device = devices.value.find(device => device.id === deviceId)
  if (device === undefined) return 'Device not found'
  return device.macAddress
}
function formatTimestamp(timestamp: bigint): string {
  const tsString = timestamp.toString()
  let ts = parseInt(tsString)
  if (tsString.length === 10) ts = ts * 1000
  return new Date(ts).toLocaleString()
}
function formatReading(reading: number): string {
  return parseFloat(reading.toString()).toFixed(2)
}

//  ┬ ┬┌─┐┌┐ ┌─┐┌─┐┌─┐┬┌─┌─┐┌┬┐
//  │││├┤ ├┴┐└─┐│ ││  ├┴┐├┤  │
//  └┴┘└─┘└─┘└─┘└─┘└─┘┴ ┴└─┘ ┴
function removeRecordHighlight(recordId: number): void {
  const index = highlightedRecords.value.findIndex(id => id === recordId)
  highlightedRecords.value.splice(index, 1)
}
function handleHighlights(id: number): void {
  highlightedRecords.value.push(id)
  // Remove it later on
  const timeout = setTimeout((): void => removeRecordHighlight(id), highlightTimeout)
  // Store the reference as we may need to remove it before it fires
  highlightTimeouts.value.push(timeout)
}
const clearHighlightTimeouts = function (): void {
  for (let i = 0, n = highlightTimeouts.value.length; i < n; i++) {
    clearTimeout(highlightTimeouts.value[i])
  }
}
function handleMessage(msg: MessageEvent): void {
  // Parse the message data
  const { channel, message } = JSON.parse(msg.data)

  // Handle device messages
  if (channel === 'device') {
    // Add it to the list of selectable devices
    devices.value.push(message)
    // No further processing
    return
  }

  // Handle telemetry messages
  if (channel === 'telemetry') {
    // Skip if last seen is past the user selected value
    if (form.date.from && (BigInt(message.timestamp) < new Date(form.date.from).getTime())) return
    if (form.date.to && (BigInt(message.timestamp) > new Date(form.date.to).getTime())) return
    // Skip if devices are selected and this message is not from a selected device
    if (totalSelectedDevices.value > 0 && form.devices.find(d => d.id === message.deviceId) === undefined) return
    // Handle new record highlights
    handleHighlights(message.id)
    // Add the record
    data.value.unshift(message)
    // Remove the last if necessary
    if (totalRecords.value > form.page.size) data.value.pop()
    // No further processing
    return
  }
}

//  ┌┬┐┌─┐┬  ┬┬┌─┐┌─┐  ┌─┐┌─┐┬  ┌─┐┌─┐┌┬┐┬┌─┐┌┐┌
//   ││├┤ └┐┌┘││  ├┤   └─┐├┤ │  ├┤ │   │ ││ ││││
//  ─┴┘└─┘ └┘ ┴└─┘└─┘  └─┘└─┘┴─┘└─┘└─┘ ┴ ┴└─┘┘└┘
const totalSelectedDevices = computed((): number => form.devices.length)
//const isSelectedDevices = computed((): boolean => totalSelectedDevices.value > 0)
let devices  = <Ref<IDevice[]>>ref([])
function selectDevice(): void {
  form.page.number = 1
  getData()
}
function deselectDevice(id: number): void {
  const indexToRemove = form.devices.findIndex(d => d.id === id)
  if (indexToRemove === -1) return // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
  form.page.number = 1
  form.devices.splice(indexToRemove, 1)
  getData()
}
function deviceOptionLabel(option: IDevice): string {
  return `${option.chipId} - ${option.name}`
}
// Add placeholder initially
function addMockPlaceholderToVselect(): void {
  // Access the input container
  let combobox = <Element>document.getElementById('vsselectDevices__combobox')?.children[0]
  let div = document.createElement('div')
  div.className = 'fake-placeholder'
  div.innerHTML = '&nbsp;Show records for devices'
  combobox.prepend(div)
}
// Toggle placeholder visibility when devices are de/selected
watch(totalSelectedDevices, (newVal): void => {
  if (newVal > 1) return
  // Access the fake placeholder element
  const el = <HTMLElement>document.getElementsByClassName('fake-placeholder')[0]
  if (newVal === 0) el.style.display = 'none'
  else el.style.display = 'inline'
})
// Hide placeholder when search input is populated
function toggleMockPlaceholderOnSearchInput(value: string): void {
  const el = <HTMLElement>document.getElementsByClassName('fake-placeholder')[0]
  const lengthOfSearchString = value.length
  if (lengthOfSearchString > 0) el.style.display = 'none'
  else el.style.display = 'inline'
}

//  ┌┬┐┌─┐┌┬┐┌─┐  ┌─┐┌─┐┬  ┌─┐┌─┐┌┬┐┬┌─┐┌┐┌
//   ││├─┤ │ ├┤   └─┐├┤ │  ├┤ │   │ ││ ││││
//  ─┴┘┴ ┴ ┴ └─┘  └─┘└─┘┴─┘└─┘└─┘ ┴ ┴└─┘┘└┘

// Don't really understand this but compiles with it
// https://bobbyhadz.com/blog/typescript-object-with-dynamic-keys
interface DateSelection { [key: string]: string | null }
const initialDateSelection = <DateSelection>reactive({
  from: null,
  to: null
})
function formatDate(date: number): string {
  return new Date(date).toLocaleString([])
}
function parseDate(dateString: string): any {
  const date = new Date(dateString)
  return {
    year: date.getFullYear(),
    month: date.getUTCMonth()+1, // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getUTCMonth
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds()
  }
}
function compareDates(oldDateString: string, newDateString: string): boolean {
  const oldDate = parseDate(oldDateString)
  const newDate = parseDate(newDateString)
  const isChangedYear = newDate.year !== oldDate.year
  const isChangedMonth = newDate.month !== oldDate.month
  const isChangedDay = newDate.day !== oldDate.day
  const isChangedHour = newDate.hour !== oldDate.hour
  const isChangedMinute = newDate.minute !== oldDate.minute
  const isChangedSecond = newDate.second !== oldDate.second
  const isChangedMilliseconds = newDate.millisecond !== oldDate.millisecond
  return isChangedYear || isChangedMonth || isChangedDay || isChangedHour || isChangedMinute || isChangedSecond || isChangedMilliseconds
}
function handleDateSelection(selectedValue: string, direction: string): void {
  // Set the date initially
  if (initialDateSelection[direction] === null) {
    let date = new Date(selectedValue)
    // Start of day
    if (direction === 'from') date.setHours(0, 0, 0, 0)
    // End of day
    else date.setHours(23, 59, 59, 999)
    // Format the date: '2022-12-25T22:11:20.294Z'
    const dateIsoString = date.toISOString()
    // Store it
    form.date[direction] = dateIsoString
    initialDateSelection[direction] = dateIsoString
    return
  }

  // Date value was cleared
  if (selectedValue === null && initialDateSelection[direction] !== null) {
    form.date[direction] = null
    initialDateSelection[direction] = null
  }
  // Date value provided, handle changes
  else {
    const date = new Date(selectedValue)
    const dateChanged = compareDates(initialDateSelection[direction] as string, date.toString())
    if (dateChanged) {
      const dateIsoString = date.toISOString()
      form.date[direction] = dateIsoString
      initialDateSelection[direction] = dateIsoString
    }
  }
}
function handleDateFromSelection(selectedValue: string): void {
  // Format and store the date value
  handleDateSelection(selectedValue, 'from')
  // Reset the page number
  form.page.number = 1
  getData()
}
function handleDateToSelection(selectedValue: string): void {
  handleDateSelection(selectedValue, 'to')
  form.page.number = 1
  getData()
}

//  ┌─┐┌─┐┌─┐┌─┐  ┬  ┌─┐┌┐┌┌─┐┌┬┐┬ ┬  ┌─┐┌─┐┬  ┌─┐┌─┐┌┬┐┬┌─┐┌┐┌
//  ├─┘├─┤│ ┬├┤   │  ├┤ ││││ ┬ │ ├─┤  └─┐├┤ │  ├┤ │   │ ││ ││││
//  ┴  ┴ ┴└─┘└─┘  ┴─┘└─┘┘└┘└─┘ ┴ ┴ ┴  └─┘└─┘┴─┘└─┘└─┘ ┴ ┴└─┘┘└┘
const pageLengthOptions = ref([10,25,50,100,250,500,1000])
function isSelectablePageLengthOptionLabel(option: number): boolean {
  return option !== form.page.size
}
function pageLengthOptionLabel(option: number): string {
  return `${option} records`
}
function changePageLength(): void {
  form.page.number = 1
  getData()
}

//  ┌─┐┌─┐┌─┐┌─┐  ┌─┐┌─┐┬  ┌─┐┌─┐┌┬┐┬┌─┐┌┐┌
//  ├─┘├─┤│ ┬├┤   └─┐├┤ │  ├┤ │   │ ││ ││││
//  ┴  ┴ ┴└─┘└─┘  └─┘└─┘┴─┘└─┘└─┘ ┴ ┴└─┘┘└┘

// the total amount of pages that are available for selection
let totalPages = ref(0)
// a range of selectable pages, dynamic based on server response for total results
let pageOptions = ref([1])
function isSelectablePageOptionLabel(option: number): boolean {
  return option !== form.page.number
}
function pageOptionLabel(option: number): string {
  return `Page ${option}`
}
function changePage(): void {
  getData()
}
function decreasePage(): void {
  if (form.page.number === 1) return
  form.page.number--
  getData()
}
function increasePage(): void {
  if (form.page.number === totalPages.value) return
  form.page.number++
  getData()
}

// When user enters the view
onMounted(async function (): Promise<void> {
  // A bit of hackery to make vue-select display selected options outside of the input
  addMockPlaceholderToVselect()
  // Fetch existing data initially
  await getDevices()
  await getData()
  // Request to receive new messages
  socket.send(JSON.stringify({ action: 'subscribe', channel: 'device' }))
  socket.send(JSON.stringify({ action: 'subscribe', channel: 'telemetry' }))
  // Handle the new messages
  socket.onmessage = (event: MessageEvent): void => handleMessage(event)
})

// When user leaves the view
onUnmounted(function (): void {
  clearHighlightTimeouts()
  if (!socket) return
  // Request that new messages are no longer sent
  socket.send(JSON.stringify({ action: 'unsubscribe', channel: 'device' }))
  socket.send(JSON.stringify({ action: 'unsubscribe', channel: 'telemetry' }))
  // Remove the event handler
  socket.onmessage = null
})
</script>

<template>
  <div class="row">
    <div class="col">
      <form class="row">
        <div class="col-md-3">
          <div class="row">
            <div class="col-md-12 mt-2 mt-md-0">
              <label class="form-label">FILTER DEVICES</label>
              <v-select
                uid="selectDevices"
                multiple
                placeholder="&nbsp;Show records for devices"
                title="Filter tables records by devices"
                v-model="form.devices"
                :options="devices"
                :getOptionLabel="deviceOptionLabel"
                @option:selecting="selectDevice"
                :disabled="isProcessingForm"
                :closeOnSelect="false"
                :deselectFromDropdown="true"
                @search="toggleMockPlaceholderOnSearchInput">
                <template
                  #selected-option-container="{ option, deselect, multiple, disabled }"
                >
                  <span></span>
                </template>
              </v-select>
            </div>
          </div>
        </div>
        <div class="col-md-5">
          <div class="row">
            <div class="col-sm-6">
              <label class="form-label">FROM DATE</label>
              <Datepicker
                title="Filter table records starting at"
                placeholder="Show records from date"
                :modelValue="form.date.from"
                @update:modelValue="handleDateFromSelection"
                :disabled="isProcessingForm"
                :format="formatDate"
                :maxDate="form.date.to || new Date()"
                :utc="true"
                :transitions="false"
                :closeOnAutoApply="false"
                autoApply
              />
            </div>
            <div class="col-sm-6 mt-2 mt-md-0">
              <label class="form-label">TO DATE</label>
              <Datepicker
                title="Filter table records ending at"
                placeholder="Show records to date"
                :modelValue="form.date.to"
                @update:modelValue="handleDateToSelection"
                :disabled="isProcessingForm"
                :format="formatDate"
                :minDate="form.date.from"
                :maxDate="new Date()"
                :utc="true"
                :transitions="false"
                :closeOnAutoApply="false"
                autoApply />
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <label class="form-label d-flex justify-content-between">
            <div>PER PAGE</div>
            <div title="Results on this page">({{ totalRecords }})</div>
          </label>
          <v-select
            uid="selectPageLength"
            title="Adjust the amount of records in the table"
            v-model="form.page.size"
            :options="pageLengthOptions"
            :getOptionLabel="pageLengthOptionLabel"
            :selectable="isSelectablePageLengthOptionLabel"
            @option:selecting="changePageLength"
            :disabled="isProcessingForm"
            :clearable="false"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label d-flex justify-content-between">
            <div>SHOW PAGE</div>
            <div class="no-selection">
              <span role="button" @click="decreasePage" title="Next page">&lt;</span>
              &nbsp;&nbsp;&nbsp;
              <span role="button" @click="increasePage" title="Previous page">&gt;</span>
            </div>
          </label>
          <v-select
            uid="selectPageNumber"
            title="Adjust the page of table data"
            v-model="form.page.number"
            :options="pageOptions"
            :getOptionLabel="pageOptionLabel"
            :selectable="isSelectablePageOptionLabel"
            @option:selecting="changePage"
            :disabled="isProcessingForm"
            :clearable="false"
          />
        </div>
      </form>

      <hr />

      <div class="row">
        <div class="col">
          <span class="badge text-bg-light" v-if="form.devices.length === 0">Selected devices will appear here</span>
          <span
            :class="['badge text-bg-light', index === 0 ? '' : 'ms-2']"
            title="Remove this device from selection"
            v-for="(device, index) in form.devices"
            :key="device.id"
            role="button"
            @click="deselectDevice(device.id)"
            v-else>
            {{ getChipId(device.id) }} - {{ getDeviceName(device.id) }}
            &nbsp;<span>X</span>
          </span>
        </div>
      </div>

      <hr class="mb-0" />

      <div class="card mt-3" v-if="totalRecords === 0">
        <div class="card-body">
          <h5 class="card-title">No Data</h5>
          <p class="card-text">Please connect a device to view hardware telemetry.</p>
        </div>
      </div>

      <div class="table-responsive" v-else>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">TIMESTAMP</th>
              <th scope="col">NAME</th>
              <th scope="col">CHIP ID</th>
              <th scope="col">MAC ADDRESS</th>
              <th scope="col">TEMPERATURE</th>
              <th scope="col">HUMIDITY</th>
              <th scope="col">HEAT INDEX</th>
              <th scope="col">SOIL MOISTURE</th>
            </tr>
          </thead>
          <tbody>
            <tr :class="calcTableRowClass(record.id)" v-for="record in data" :key="record.id">
              <th scope="row">{{ formatTimestamp(record.timestamp) }}</th>
              <td>{{ getDeviceName(record.deviceId) }}</td>
              <td>{{ getChipId(record.deviceId) }}</td>
              <td>{{ getMacAddress(record.deviceId) }}</td>
              <td>{{ formatReading(record.temperature) }}&#8451;</td>
              <td>{{ record.humidity }}%</td>
              <td>{{ formatReading(record.heatIndex) }}&#8451;</td>
              <td>{{ record.soilMoisture }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style>
  .fake-placeholder {
    font-size: 0.875rem;
    color: #6c757d;
    opacity: 1;
    margin: 4px 0 0;
    padding: 0 7px;
    display: none;
    position: absolute;
  }
</style>
<style scoped lang="scss">
  label {
    font-family: 'open_sanssemibold';
  }
  .badge {
    font-size: var(--bs-pagination-font-size);
    line-height: 24px;
    font-weight: 400;
    border: 2px solid #dee2e6;
    padding: 5px 10px;

    span {
      font-family: 'open_sanssemibold';
      font-weight: bold;
    }
  }
  thead th {
    font-family: 'open_sanssemibold';
    font-weight: 400;
  }
  .no-selection {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
</style>
# Interactive date and time slider
![time-slider](./demo.gif)
## Introduction

This script allows filtering layers based on a start date, an end date, and a time range.
The editor can modify the script to choose which layers should be filtered by date.

The filter is based on a column of the layer using the following formula:
```javascript
filter: layerName +': ( "debut" IS NULL OR "debut" <= '' + date_start + '' AND "fin" IS NULL OR "fin" >= '' + date_end + '' )'
```

The editor can adjust the filter as needed.
Dates in the columns must be in the format "yyyy-MM-ddTHH:mm", but it is possible to filter according to another format by adapting the script.

The timeSlider.js script comes from this [project](https://github.com/marcneuwirth/jquery-ui-timeslider) and was created using jQuery UI.







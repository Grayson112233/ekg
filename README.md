# Arduino EKG Chrome Interface

## Overview

Chrome app based real time streaming interface to the Olimex Arduino EKG Shield. For details see <http://www.talkingquickly.co.uk/2015/01/diy-ekg-with-arduino-javascript/>

`Q`, `R`, `S`, and `T` points of the cardiogaphy waveform are programmatically identified and used to calculate various intervals such as the `QRS Complex` and the `QTc interval`. These data points can be used to identify a multitude heart conditions.

![Normal Status Screenshot](/screenshots/normal.png)
*Normal Status*

![Flatline Alert Screenshot](/screenshots/flatline.png)
*Flatline Alert*

This application uses chrome's serial input. Make sure to set the correct port for your specific device in the designated part of the `ekg.js`

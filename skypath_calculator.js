// Equations based on NOAA’s Solar Calculator; all angles in radians.
// http://www.esrl.noaa.gov/gmd/grad/solcalc/

(function() {
  // Define some constants and conversion factors
  var J2000 = Date.UTC(2000, 0, 1, 12),
      π = Math.PI,
      τ = 2 * π,
      radians = π / 180,
      degrees = 180 / π;

  skypathCalculator = function(astroCoordinates, earthCoordinates) {
    // `astroCoordinates` is in the form [RA, Dec] in degrees
    // `earthCoordinates` is in the form [longitude, latitude] in degrees
    var longitude = earthCoordinates[0],
        dayOffset = longitude / 360, // Offset from UTC, i.e. (local date in decimal days) = (UTC date in decimal days) + dayOffset
        λ = earthCoordinates[0] * radians, // longitude in radians
        φ = earthCoordinates[1] * radians, // latitude in radians
        α = astroCoordinates[0] * radians, // RA in radians
        δ = astroCoordinates[1] * radians, // Dec in radians
        cosδ = Math.cos(δ),
        sinδ = Math.sin(δ),
        cosφ = Math.cos(φ),
        sinφ = Math.sin(φ);

    function position(date) {
      var greenwichSolarTimeDays = (date - J2000) / 864e5
          greenwichSiderealTimeHours = 18.697374558 + 24.06570982441908 * greenwichSolarTimeDays,
          ha = greenwichSiderealTimeHours * τ / 24 + λ - α, // hour angle in radians
          sinha = Math.sin(ha),
          cosha = Math.cos(ha),
          azimuth = Math.atan2( sinha , cosha * sinφ - sinδ / cosδ * cosφ ), // 0 is south, with positive turning west (add 180 deg if 0 is north)
          altitude = Math.asin( sinφ * sinδ + cosφ * cosδ * cosha );
            
      return [azimuth * degrees + 180, altitude * degrees];
    }

    return {
      position: position
    };
  };

})();

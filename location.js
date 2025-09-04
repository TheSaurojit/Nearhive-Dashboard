function deg2rad(deg) {
  return deg * (Math.PI / 180);
}



function getDistanceFromLatLon({ lat1, lon1 }, { lat2, lon2 }) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

console.log(getDistanceFromLatLon(
    {
        lat1 : 24.868977530363683 ,
        lon1 : 92.36421713525286 
    } ,
    {
        lat2 : 24.8626014 ,
        lon2 : 92.3716762 ,
    }
));

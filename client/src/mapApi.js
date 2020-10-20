
export function compileLocationData(data) {
	// data coming in will be an array of location items
	// takes an array of items and scrapes it for an array of object items

	// console.log(data);

	var items = [];

	if (data != null) {
		for (var i = 0; i < data.length; i++) {
			var place_type;
			var postal_code;
			var address;
			var city;
			var place;
			var region;
			var country;
			var place_properties;
			var lat;
			var lng;
			var full_place;

			if (data[i] != null) {
				place = data[i].text;
				full_place = data[i].place_name;

				lat = data[i].center[1];
				lng = data[i].center[0];

				if (data[i].properties != null)
					place_properties = data[i].properties;
				if (data[i].properties.address != null)
					address = data[i].properties.address

				if (data[i].context != null) {
					for (var j = 0; j < data[i].context.length; j++) {
						if (data[i].context[j].id.includes("region"))
							region = data[i].context[j].short_code;
						else if (data[i].context[j].id.includes("country")) 
							country = data[i].context[j].text;
						else if (data[i].context[j].id.includes("postcode"))
							postal_code = data[i].context[j].text;
						else if (data[i].context[j].id.includes("place"))
							city = data[i].context[j].text;
					}
				}
			}

			var item = {
				place_type: place_type,
				postal_code: postal_code,
				address: address,
				city: city,
				place: place,
				region: region,
				country: country,
				place_properties: place_properties,
				lat: lat,
				lng: lng,
				full_place: full_place,
			};

			items.push(item);
		}
	}

	return items;
}
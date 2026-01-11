export class Asset {

	constructor(id, initialData={}) {
		this.id = id;

		const data = localStorage.getItem(id);
        if (data === null) {
			const serialized = JSON.stringify(initialData);
			localStorage.setItem(id, serialized);
			Object.assign(this, initialData);
        }
        else {
            const deserialized = JSON.parse(data);
			Object.assign(this, deserialized);
        }
	}

	save() {
		const data = { ...this };
		delete data['id'];

		const serialized = JSON.stringify(data);
		localStorage.setItem(this.id, serialized);
	}
}
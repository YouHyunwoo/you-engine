Array.prototype.contains = function (point) {
    if (this.length === 4) {
        if (point.length === 2) {
            return this[0] <= point[0] && point[0] < this[0] + this[2] &&
                this[1] <= point[1] && point[1] < this[1] + this[3];
        }
    }

    throw Error();
};
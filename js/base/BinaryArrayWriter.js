/**
 * BinaryArrayWriter - Handles writing data to binary format for game saves
 * Based on the original Factory Idle implementation
 */

define("base/BinaryArrayWriter", [], function() {
    
    function BinaryArrayWriter() {
        this.totalLength = 0;
        this.data = [];
    }
    
    BinaryArrayWriter.prototype._write = function(value, length, method) {
        this.data.push({ length: length, value: value, method: method });
        this.totalLength += length;
        return this;
    };
    
    BinaryArrayWriter.prototype.writeBooleanMap = function(booleanMap) {
        return this.writeUint8(booleanMap.getValue());
    };
    
    BinaryArrayWriter.prototype.writeChar = function(char) {
        return this.writeUint8(char.charCodeAt(0));
    };
    
    BinaryArrayWriter.prototype.writeInt8 = function(value) {
        return this._write(value, 1, "setInt8");
    };
    
    BinaryArrayWriter.prototype.writeInt16 = function(value) {
        return this._write(value, 2, "setInt16");
    };
    
    BinaryArrayWriter.prototype.writeInt32 = function(value) {
        return this._write(value, 4, "setInt32");
    };
    
    BinaryArrayWriter.prototype.writeUint8 = function(value) {
        return this._write(value, 1, "setUint8");
    };
    
    BinaryArrayWriter.prototype.writeUint16 = function(value) {
        return this._write(value, 2, "setUint16");
    };
    
    BinaryArrayWriter.prototype.writeUint32 = function(value) {
        return this._write(value, 4, "setUint32");
    };
    
    BinaryArrayWriter.prototype.writeFloat64 = function(value) {
        return this._write(value, 8, "setFloat64");
    };
    
    BinaryArrayWriter.prototype.writeWriter = function(writer) {
        if (writer) {
            this.writeInt32(writer.getTotalLength());
            var data = writer.getData();
            for (var i = 0; i < data.length; i++) {
                this._write(data[i].value, data[i].length, data[i].method);
            }
        } else {
            this.writeInt32(0);
        }
        return this;
    };
    
    BinaryArrayWriter.prototype.writeBooleansArrayFunc = function(array, func) {
        var booleanMap = null;
        for (var i = 0; i < array.length; i++) {
            if (booleanMap === null) {
                booleanMap = new BinaryBoolean();
            }
            booleanMap.writeBoolean(func(array[i]) ? 1 : 0);
            if ((i + 1) % 8 === 0) {
                this.writeBooleanMap(booleanMap);
                booleanMap = null;
            }
        }
        if (booleanMap) {
            booleanMap.fillZero();
            this.writeBooleanMap(booleanMap);
        }
        return this;
    };
    
    BinaryArrayWriter.prototype.getData = function() {
        return this.data;
    };
    
    BinaryArrayWriter.prototype.getTotalLength = function() {
        return this.totalLength;
    };
    
    BinaryArrayWriter.prototype.getBuffer = function() {
        var buffer = new ArrayBuffer(this.totalLength);
        var dataView = new DataView(buffer, 0);
        var offset = 0;
        
        for (var i = 0; i < this.data.length; i++) {
            var item = this.data[i];
            dataView[item.method](offset, item.value);
            offset += item.length;
        }
        
        return buffer;
    };
    
    return BinaryArrayWriter;
});

/**
 * BinaryBoolean - Helper class for handling boolean arrays
 */
define("base/BinaryBoolean", [], function() {
    
    function BinaryBoolean() {
        this.buffer = 0;
        this.length = 0;
    }
    
    BinaryBoolean.prototype.writeAll = function() {
        for (var i = 0; i < 8; i++) {
            this.writeBoolean(arguments[i]);
        }
        return this;
    };
    
    BinaryBoolean.prototype.writeBoolean = function(value) {
        this.buffer <<= 1;
        this.buffer |= value ? 1 : 0;
        this.length++;
        return this;
    };
    
    BinaryBoolean.prototype.fillZero = function() {
        for (var i = this.length; i < 8; i++) {
            this.writeBoolean(0);
        }
    };
    
    BinaryBoolean.prototype.readBoolean = function() {
        var value = this.buffer & 1;
        this.buffer >>= 1;
        return !!value;
    };
    
    BinaryBoolean.prototype.getValue = function() {
        return this.buffer;
    };
    
    BinaryBoolean.prototype.reverse = function() {
        var values = [];
        for (var i = 0; i < 8; i++) {
            values.push(this.readBoolean());
        }
        for (var i = 0; i < 8; i++) {
            this.writeBoolean(values[i]);
        }
        return this;
    };
    
    BinaryBoolean.prototype.toString = function() {
        return this.buffer;
    };
    
    return BinaryBoolean;
});

class Uniform {
    _GL = null;
    _program = null;
    _name = null;
    _type = null;
    _value = null;
    _location = null;

    constructor(GL, program, name, type, ...value) {
        // Type is in the format of [1234][fi][v] or Matrix[234]fv
        this._GL = GL;
        this._program = program;
        this._name = name;
        this._type = type;

        this._GL.useProgram(this._program);
        this._location = this._GL.getUniformLocation(this._program, this._name);
        
        if (value.length != 0)
            this.setValue(...value);  // Use the setter
    }

    get program() {
        return this._program;
    }

    get name() {
        return this._name;
    }

    get type() {
        return this._type;
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this.setValue(val);
    }
    
    // For multiple parameter values
    setValue(...val) {
        this._value = val;
    }

    apply() {
        if (this._value == null) {
            console.warn(`Empty uniform '${this.name}'`);
            return;
        }
        this._GL.useProgram(this._program);
        this._GL["uniform"+this._type](this._location, ...this._value);
    }

    get location() {
        return this._location;
    }
}

class UniformConfig {
    _GL = null;
    _program = null;
    _uniforms = null;

    constructor(GL, program) {
        this._GL = GL;
        this._program = program;
        this._uniforms = {};
    }

    addUniform(name, type, ...value) {
        if (this.hasUniform(name))
            throw new Error(`Cannot add uniform '${name}' as it already exists`);
        this._uniforms[name] = new Uniform(this._GL, this._program, name, type, ...value);
    }

    addUniforms(uniforms_info) {
        uniforms_info.forEach(uniform_info=>this.addUniform(...uniform_info));
    }

    hasUniform(uniformName) {
        return (uniformName in this._uniforms);
    }

    setUniformValue(uniformName, ...value) {
        if (!this.hasUniform(uniformName))
            throw new Error(`Cannot set uniform '${uniformName}', as it doesn't exist`);
        this._uniforms[uniformName].setValue(...value);
    }

    applyUniform(uniformName) {
        this._uniforms[uniformName].apply();
    }

    setAndApplyUniformValue(uniformName, ...value) {
        this.setUniformValue(uniformName, ...value);
        this.applyUniform(uniformName);
    }

    applyAll() {
        for (const uniform of Object.values(this._uniforms)) {
            uniform.apply();
        }
    }

    getUniformValue(uniformName) {
        return this._uniforms[uniformName].value;
    }

    removeUniform(uniformName) {
        delete this._uniforms[uniformName];
    }
}

class ProgramInfo {
    _GL = null;
    _program = null;
    _uniformConfig = null;
    
    constructor(GL, program) {
        this._GL = GL;
        this._program = program;
        this._uniformConfig = new UniformConfig(this._GL, this._program);
    }

    get program() {
        return this._program;
    }

    get uniformConfig() {
        return this._uniformConfig;
    }

    createUniformConfig() {
        return new UniformConfig(this._GL, this._program);
    }
}
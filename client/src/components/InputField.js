import React from 'react';

class InputField extends React.Component {

    render() {
        return (
            <div className="input-field">
                <input
                    className={this.props.className || 'input'}
                    type={this.props.type}
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    onChange={ (e) => this.props.onChange(e.target.value) } // pass new target value (the input box is the target) to the change function when called
                /> 
            </div>
        )
    }
}

export default InputField;
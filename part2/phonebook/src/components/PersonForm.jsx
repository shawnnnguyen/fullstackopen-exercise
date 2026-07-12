const PersonForm = ({nameValue, numberValue, nameOnChange, numberOnChange, onSubmit}) => {
    return (
        <form onSubmit={onSubmit}>
        <div>
          name: <input 
            type="text"
            value={nameValue}
            onChange={nameOnChange}/>
        </div>
        <div>
          phone number: <input 
            type="text"
            value={numberValue}
            onChange={numberOnChange}/>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    )
}

export default PersonForm
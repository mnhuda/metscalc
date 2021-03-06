/*
   Copyright 2019 University of Florida

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var React = window.React || require('react')
var ReactDOM = window.ReactDOM || require('react-dom')
var moment = window.moment || require('moment')

const msscalc = require('./msscalc')
const bmi = require('./bmi')

class Calculator extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      age: null,
      sex: '',
      race: '',
      hdl: '',
      sbp: '',
      triglyceride: '',
      glucose: '',
      waist: '',
      waistUnit: 'cm',
      weight: '',
      weightUnit: 'kg',
      height: '',
      heightUnit: 'cm',
      bmiadult: '',
      bmiz: '',
      birth: '',
      appointment: moment().format(moment.HTML5_FMT.DATE),
      result: null
    }

    this.handleBack = this.handleBack.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.afterUpdate = this.afterUpdate.bind(this)
  }

  render () {
    let {
      age, sex, race, weight, weightUnit, height, heightUnit, hdl, sbp, triglyceride,
      glucose, waist, waistUnit, bmiadult, bmiz, birth, appointment, result
    } = this.state

    const adolescent = age !== null && age < 20

    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Demographics</h3>
        <div className="form-group">
          <label htmlFor="birth">Birthdate <em>(if younger than 20 years old)</em></label>
          <input className="form-control" type="date" name="birth" value={birth}
            placeholder="Ex. 1984-12-23"
            onChange={this.handleChange}></input>
        </div>
        {birth && (
          <div className="form-group">
            <label htmlFor="appointment">Appointment Date</label>
            <input className="form-control" type="date" name="appointment" value={appointment} onChange={this.handleChange}></input>
          </div>
        )}
        {birth && appointment && (
          <div className="form-group">
            <label htmlFor="age">Age at Appointment (years)</label>
            <input className="form-control" name="age" type="number" readOnly
              value={age === null ? '' : age}
            />
          </div>
        )}

        <ButtonGroup
          name="sex" label="Sex" value={sex} required options={msscalc.Sex}
          onClick={this.handleClick}
        />

        <ButtonGroup
          name="race" label="Race and Ethnicity" value={race} required
          options={{
            'Hispanic': msscalc.RaceEthnicity.Hispanic,
            'Non-Hispanic Black': msscalc.RaceEthnicity.Black,
            'Non-Hispanic White': msscalc.RaceEthnicity.White
          }}
          onClick={this.handleClick}
        />

        <h3>Measurements</h3>
        <div className="form-group">
          <label htmlFor="height">Height</label>
          <Measurement name="height" value={height} unit={heightUnit}
            min="0" required
            onValueChange={this.handleChange} onUnitChange={this.handleChange}
            units={{
              cm: 'Centimeters (cm)',
              in: 'Inches (in)'
            }}
          />
        </div>

        <label htmlFor="weight">Weight</label>
        <Measurement name="weight" value={weight} unit={weightUnit}
          min="0" required
          onValueChange={this.handleChange} onUnitChange={this.handleChange}
          units={{
            kg: 'Kilograms (kg)',
            lbs: 'Pounds (lbs)'
          }}
        />

        {!adolescent && (
          <div className="form-group">
            <label htmlFor="waist">Waist Circumference <em>(if available)</em></label>
            <Measurement name="waist" value={waist} unit={waistUnit}
              min="0"
              onValueChange={this.handleChange} onUnitChange={this.handleChange}
              units={{
                cm: 'Centimeters (cm)',
                in: 'Inches (in)'
              }}
            />
          </div>
        )}

        {bmiadult && (
          <div className="form-group">
            <label htmlFor="bmiadult"> BMI </label>
            <input className="form-control" name="bmiadult" value={bmiadult.toFixed(3)} readOnly />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="sbp">Systolic Blood Pressure (mmHg)</label>
          <input className="form-control" name="sbp" type="number"
            min="0" required step="any" value={sbp}
            placeholder="Ex: 120"
            onChange={this.handleChange}></input>
        </div>

        <h3>Lab Values</h3>
        <div className="form-group">
          <label htmlFor="hdl"><abbr title="High-density lipoprotein">HDL</abbr> (mg/dL)</label>
          <input className="form-control" name="hdl" type="number" required
            min="0" step="any" value={hdl}
            placeholder="Ex: 50"
            onChange={this.handleChange}></input>
        </div>

        <div className="form-group">
          <label htmlFor="triglyceride">Triglycerides (mg/dL)</label>
          <input className="form-control" name="triglyceride" type="number"
            min="0" step="any" required value={triglyceride}
            placeholder="Ex: 120"
            onChange={this.handleChange}></input>
        </div>

        <div className="form-group">
          <label htmlFor="glucose">Fasting Glucose (mg/dL)</label>
          <input className="form-control" name="glucose" type="number"
            min="0" step="any" required value={glucose}
            placeholder="Ex: 75"
            onChange={this.handleChange}></input>
        </div>

        {!result && (
          <button type="submit" className="btn btn-primary float-right">
          Calculate
          </button>
        )}

        {result && (
          <div className="result">
            <h2>Results</h2>

            <div className="row">
              {adolescent && bmiz && (
                <div className="col-sm">
                  <p>BMI Z-Score for Adolescents
                    <span className="amount">{bmiz.toFixed(3)}</span>
                  </p>
                  <p>BMI Percentile for Adolescents
                    <span className="amount">{msscalc.Percentile(bmiz).toFixed(2)}%</span>
                  </p>
                </div>
              )}

              <div className="col-sm">
                {result.mets_z_bmi && (
                  <p>MetS Z-Score based on Body Mass Index
                    <span className="amount">{result.mets_z_bmi.toFixed(3)}</span>
                  </p>
                )}
                {result.mets_z_bmi && (
                  <p>MetS Percentile based on Body Mass Index
                    <span className="amount">{msscalc.Percentile(result.mets_z_bmi).toFixed(2)}%</span>
                  </p>
                )}
              </div>

              {result.mets_z_wc && (
                <div className="col-sm">
                  {result.mets_z_wc && (
                    <p>MetS Z-Score based on Waistline
                      <span className="amount">{result.mets_z_wc.toFixed(3)}</span>
                    </p>
                  )}
                  {result.mets_z_wc && (
                    <p>MetS Percentile based on Waistline
                      <span className="amount">{msscalc.Percentile(result.mets_z_wc).toFixed(2)}%</span>
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </form>
    )
  }

  handleBack (event) {
    event.preventDefault()
    this.setState({ result: null })
  }

  handleChange (event) {
    event.persist()

    this.setState({ [event.target.name]: event.target.value }, () => {
      this.afterUpdate()
      runValidator(event.target)
    })
  }

  handleClick (event) {
    let input

    switch (event.target.tagName.toLowerCase()) {
      case 'input':
        input = event.target
        break

      case 'label':
        input = event.target.getElementsByTagName('input')[0]
        break
    }

    if (!input) {
      return
    }

    this.setState({ [input.name]: input.value }, () => {
      this.afterUpdate()
      runValidator(input)
    })
  }

  handleSubmit (event) {
    event.preventDefault()

    let {
      age, bmiadult, sex, race, hdl, sbp, triglyceride, glucose, waist, waistUnit,
      birth, appointment, bmiz, weight, height
    } = this.state

    if (!(sex && race && sbp && glucose && hdl && triglyceride) || !((weight && height) || waist)) {
      alert('Please fill out the required fields.')
      return
    }

    if (age !== null && age < 2) {
      alert('The age at appointment time must be at least 2 years old.')
      return
    }

    const result = msscalc.CalculateMSS({
      age: age ? moment(appointment).diff(moment(birth), 'years') : 25,
      sex,
      race,
      bmi: bmiadult,
      hdl,
      sbp,
      triglyceride,
      glucose,
      bmiZScore: bmiz,
      waist: waist && (age === null || age > 20) ? centimeters(waist, waistUnit) || null : null
    })

    this.setState({ result })
  }

  afterUpdate () {
    const { birth, appointment, weight, weightUnit, height, heightUnit, sex } = this.state

    let age = null
    let bmiz = ''
    let bmiadult = ''

    if (birth && appointment) {
      age = moment(appointment).diff(moment(birth), 'years')
    }

    if (height && weight) {
      const weightKG = kilograms(weight, weightUnit)
      const heightMeters = meters(height, heightUnit)

      bmiadult = bmi.BMIAdult(weightKG, heightMeters)

      const adolescent = age !== null && age >= 2 && age < 20
      if (adolescent && sex) {
        const agemos = moment(appointment).diff(moment(birth), 'months')
        const sexord = sex === 'MALE' ? bmi.Sex.Male : bmi.Sex.Female
        bmiz = bmi.BMIZscore(weightKG, heightMeters, sexord, agemos)
      }
    }

    this.setState({
      age,
      bmiz,
      bmiadult: bmiadult,
      result: null
    })
  }
}

// meters converts the length from units into meters.
function meters (length, units) {
  if (isNaN(parseFloat(length))) {
    console.error('length must be a number; got:', length)
    return null
  }

  switch (units) {
    case 'm':
      return length

    case 'cm':
      return length / 100

    case 'in':
      // https://www.google.com/search?q=in+to+m
      return length / 39.37
  }

  console.error("units must be 'm', 'cm', or 'in'; got:", units)
  return null
}

function centimeters (length, units) {
  if (isNaN(parseFloat(length))) {
    console.error('length must be a number; got:', length)
    return null
  }

  switch (units) {
    case 'cm':
      return length

    case 'm':
      return length * 100

    case 'in':
      // https://www.google.com/search?q=in+to+cm
      return length * 2.54
  }

  console.error("units must be 'm', 'cm', or 'in'; got:", units)
  return null
}

// kilograms converts the mass from units into kilograms.
function kilograms (mass, units) {
  if (isNaN(parseFloat(mass))) {
    console.error('mass must be a number; got:', mass)
    return null
  }

  switch (units) {
    case 'kg':
      return mass

    case 'lbs':
      // See https://www.ngs.noaa.gov/PUBS_LIB/FedRegister/FRdoc59-5442.pdf
      return mass * 0.45359237
  }

  console.error("units must be 'kg' or 'lbs'; got:", units)
  return null
}

function runValidator (target) {
  if (!target.checkValidity || !target.reportValidity) {
    return
  }

  if (!target.checkValidity()) {
    target.classList.add('is-invalid')
  } else {
    target.classList.remove('is-invalid')
  }
  target.reportValidity()
}

function ButtonGroup (props) {
  const { name, label, options, value, required, onClick, onKeyPress } = props

  if (!options || options.length === 0) {
    return null
  }

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <div className="input-group btn-group btn-group-toggle" data-toggle="buttons">
        {Object.keys(options).map(label => (
          <Button key={label}
            required={required}
            group={name} label={label} value={options[label]}
            pressed={value === options[label]}
            onClick={onClick} onKeyPress={onKeyPress}
          />
        ))}
      </div>
    </div>
  )
}

function Button (props) {
  const { group, label, pressed, value, onClick, onKeyPress, required = false } = props

  return (
    <label className= {`btn btn-light ${pressed ? 'active' : ''}`}
      role="button"
      checked={pressed}
      aria-pressed={pressed}
      onClick={onClick} onKeyPress={onKeyPress}
    >
      <input type="radio" name={group} value={value} autoComplete="off" required={required} /> {label}
    </label>
  )
}

function Measurement (props) {
  const {
    name, unit, units, value, onValueChange, onUnitChange, min, max, required
  } = props

  return (
    <div className="Measurement input-group">
      <input className="form-control" name={name} type="number" min={min} max={max}
        required={required} step="any" value={value} onChange={onValueChange}></input>
      {units && (
        <div className="input-group-append">
          <select className="custom-select" value={unit} name={`${name}Unit`} onChange={onUnitChange}>
            {Object.keys(units).map(key => (
              <option key={key} value={key}>{units[key]}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

ReactDOM.render(<Calculator />, document.getElementById('calculator'))

function resizeBtnGroup () {
  const groups = document.getElementsByClassName('btn-group')

  const smallWindow = window.innerWidth < 500
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    if (smallWindow) {
      group.classList.add('btn-group-vertical')
    } else {
      group.classList.remove('btn-group-vertical')
    }
  }
}

window.onresize = resizeBtnGroup
resizeBtnGroup()

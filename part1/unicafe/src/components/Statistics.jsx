import StatisticLine from './StatisticLine'

const Statistics = ({ good, neutral, bad }) => {
    const all = good + neutral + bad

    if (all === 0) {
        return (
            <div>
                <h1>statistics</h1>
                <p>No feedback given</p>
            </div>
        )
    }
    
    return (
        <table>
            <tbody>
            <StatisticLine text="good" value={good} />
            <StatisticLine text="neutral" value={neutral} />
            <StatisticLine text="bad" value={bad} />
            <StatisticLine text="all" value={all} />
            <StatisticLine text="average" value={(good - bad) / all} />
            <StatisticLine text="positive" value={good / all * 100 + '%'} />
            </tbody>
        </table>
    )
}

export default Statistics
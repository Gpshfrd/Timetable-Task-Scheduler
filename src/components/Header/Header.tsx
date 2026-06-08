import './Header.css'

function Header() {
    const date = new Date()
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.toLocaleString('en-US', { year: 'numeric' });

    return (
        <header className="header">
            <h1 className='date'>{month}, {year}</h1>
            <div className="user">
                <h2 className='username'>Username</h2>
                <div className="avatar"></div>
            </div>
        </header>
    )
}

export default Header
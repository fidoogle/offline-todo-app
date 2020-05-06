import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';


const useStyles = makeStyles((theme) => ({
    root: {
        width: '90vw',
        //maxWidth: 500,
        backgroundColor: theme.palette.background.paper,
    },
}));

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}
function formatDate(value) {
    if (isValidDate(new Date(value))) {
        const todate = new Date(value)
        return todate.toLocaleDateString("en-US")
    }
    return value
}

export default function CheckboxList({ todos, handleCompleted, handleDelete }) {
    const classes = useStyles();
    //const [todos, setTodos] = useState([])

    useEffect(() => {
        //TODO: may need to refresh this components with new props.todos
    }, [todos])

    return (
        <List className={classes.root}>
            {todos.map((todo, index) => {
                const labelId = `checkbox-list-label-${todo.id}`;

                return (
                    //TODO: add click handler to rows to toggle checkbox
                    <ListItem 
                        key={todo.id || index} 
                        dense button 
                        alignItems="flex-start"
                        // add a strike style depending on the completed property of the todo item
                        style={{ textDecoration : todo.completed ? 'line-through' : 'none' }}
                    >
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={!!todo.completed}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                                onChange={event => handleCompleted(event, todo)}
                            />
                        </ListItemIcon>
                        <ListItemText
                            id={labelId}
                            primary={`${todo.name} - Target: ${formatDate(todo.target_date)}`}
                            secondary={
                                <React.Fragment>
                                    {todo.description}
                                    <Typography
                                        component="b"
                                        variant="body2"
                                        className={classes.inline}
                                        color="textSecondary"
                                    >
                                        <br />Completed: {formatDate(todo.completion_date)}
                                    </Typography>
                                </React.Fragment>
                            }
                        />
                        {todo.completed && 
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="delete"
                                    onClick={() => handleDelete(todo.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        }
                    </ListItem>
                );
            })}
        </List>
    );
}

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { push } from 'connected-react-router'
import {
  Card,
  CardActions,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Grid,
  TextField,
  IconButton,
  Typography
} from '@material-ui/core'
import { Delete, Clear } from '@material-ui/icons'
import { CircularProgress, Checkbox } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import { removeList } from '../actions/checklists'
import {
  addEntry,
  loadEntries,
  setEntryValue,
  removeEntry
} from '../actions/entries'

import ConfirmationDialog from './ConfirmationDialog'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2
  },
  textField: {
    width: '100%'
  }
})

class Checklist extends Component {
  state = {
    confirmDeleteListOpen: false,
    confirmDeleteEntryOpen: false,
    entId: ''
  }

  componentDidUpdate(prevProps) {
    if (prevProps.list && !this.props.list) {
      // The list was deleted - go back home
      this.props.dispatch(push('/'))
    } else if (!prevProps.list && this.props.list) {
      const { list, dispatch } = this.props
      dispatch(loadEntries({ listId: list.listId }))
    }
  }

  componentDidMount() {
    this.setState({ newEntryTitle: '' })
    const { list, dispatch } = this.props
    if (this.props.list) {
      dispatch(loadEntries({ listId: list.listId }))
    }
  }

  validate = () => this.state.newEntryTitle.trim().length > 0

  handleSubmit = event => {
    event.preventDefault()
    if (this.validate()) {
      this.props.dispatch(
        addEntry({
          listId: this.props.list.listId,
          title: this.state.newEntryTitle
        })
      )
      this.setState({ newEntryTitle: '' })
    }
  }

  handleEntryTitleChange = ({ target: { value } }) => {
    this.setState({ newEntryTitle: value })
  }

  handleChange = ({ target: { id, checked } }) => {
    const { dispatch, list, entries } = this.props
    const entry = entries.find(ent => ent.entId === id)
    dispatch(
      setEntryValue({
        listId: list.listId,
        entry: { ...entry, value: checked }
      })
    )
  }

  handleEntryRemoval = e => {
    this.setState({ entId: '' })
    this.setState({ confirmDeleteEntryOpen: true })
    this.setState({ entId: e.currentTarget.id })
  }

  handleEntryRemovalClose = () => {
    this.setState({ confirmDeleteEntryOpen: false })
  }

  handleRemoveListRequest = () => {
    this.setState({ confirmDeleteListOpen: true })
  }

  handleListRemovalClose = () => {
    this.setState({ confirmDeleteListOpen: false })
  }

  handleRemoveList = () => {
    const { dispatch, list } = this.props
    dispatch(removeList({ listId: list.listId }))
  }

  handleRemoveListEntry = () => {
    const { dispatch, list } = this.props
    dispatch(removeEntry({ listId: list.listId, entId: this.state.entId }))
    this.setState({ confirmDeleteEntryOpen: false })
  }

  render() {
    const {
      addingEntry,
      addEntryError,
      removing,
      classes,
      gettingListEntries,
      listEntriesError,
      entries,
      list,
      entryValueUpdateError,
      updatingEntryValue,
      removingEntry,
      removeEntryError
    } = this.props

    if (!list) {
      // List was deleted, go home
      return <Redirect to="/" />
    }

    // ConfirmationDialog
    const confirmDeleteDialog = (
      <ConfirmationDialog
        tile="Delete List?"
        open={this.state.confirmDeleteListOpen}
        message={`Are you sure you want to remove the list '${list &&
          list.name}' permanently?`}
        onConfirm={this.handleRemoveList}
        onClose={this.handleListRemovalClose}
      />
    )

    const deleteEntryDialog = (
      <ConfirmationDialog
        tile="Delete Entry?"
        open={this.state.confirmDeleteEntryOpen}
        message="Are you sure you want to remove this entry permanently?"
        onConfirm={this.handleRemoveListEntry}
        onClose={this.handleEntryRemovalClose}
      />
    )

    const newItemEntry = addingEntry ? (
      <Loading />
    ) : (
      <ListItem>
        <TextField
          id="newEntryTitle"
          placeholder="Add an Item..."
          autoFocus
          form="new-item-form"
          className={classes.textField}
          onChange={this.handleEntryTitleChange}
        />
      </ListItem>
    )

    const errorItem =
      !gettingListEntries &&
      !addingEntry &&
      !removingEntry &&
      (listEntriesError || addEntryError || removeEntryError) ? (
        <ListItem>
          <ErrorMessage
            messageId={
              (listEntriesError || addEntryError || removeEntryError).id
            }
          />
        </ListItem>
      ) : null

    const entryError =
      !updatingEntryValue && entryValueUpdateError ? (
        <ListItem>
          <ErrorMessage messageId={entryValueUpdateError.id} />
        </ListItem>
      ) : null

    return list && !gettingListEntries ? (
      <form id="new-item-form" onSubmit={this.handleSubmit} autoComplete="off">
        {confirmDeleteDialog}
        {deleteEntryDialog}
        <Grid container layout="row" className={classes.root} justify="center">
          <Grid item xs={10} sm={8} md={4} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {list.name}
                </Typography>
                <List>
                  {entries.map((entry, index) => (
                    <ListItem key={index}>
                      <ListItemText>{entry.title}</ListItemText>
                      <Checkbox
                        onChange={this.handleChange}
                        id={entry.entId}
                        checked={!!entry.value}
                      />
                      <IconButton
                        onClick={this.handleEntryRemoval}
                        id={entry.entId}
                      >
                        <Clear />
                      </IconButton>
                    </ListItem>
                  ))}
                  {newItemEntry}
                  {errorItem}
                  {entryError}
                </List>
              </CardContent>
              <CardActions>
                {removing ? (
                  <CircularProgress />
                ) : (
                  <IconButton onClick={this.handleRemoveListRequest}>
                    <Delete />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </form>
    ) : (
      <Loading />
    )
  }
}

Checklist.propTypes = {
  addEntryError: PropTypes.object,
  addingEntry: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  gettingListEntries: PropTypes.bool.isRequired,
  updatingEntryValue: PropTypes.bool.isRequired,
  listEntriesError: PropTypes.isRequired,
  entryValueUpdateError: PropTypes.object,
  removeEntryError: PropTypes.object,
  removingEntry: PropTypes.object,
  removing: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  entries: PropTypes.array.isRequired,
  list: PropTypes.object
}

const makeMapStateToProps = (initialState, ownProps) => {
  const {
    match: {
      params: { id: listId }
    }
  } = ownProps

  return ({
    checklists: {
      addingEntry,
      addEntryError,
      entryValueUpdateError,
      gettingListEntries,
      listEntriesError,
      listsById,
      entriesByListId,
      removing,
      updatingEntryValue
    }
  }) => {
    const list = listId ? listsById[listId] : {}
    const entries = entriesByListId[listId] || []
    return {
      addingEntry,
      addEntryError,
      entries,
      entriesByListId,
      entryValueUpdateError,
      gettingListEntries,
      list,
      listsById,
      listEntriesError,
      removing,
      updatingEntryValue
    }
  }
}

export default connect(makeMapStateToProps)(withStyles(styles)(Checklist))

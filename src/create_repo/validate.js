// TODO: Validate team specified exists
module.exports = async ({github, context, core}) => {
    const issueForm = JSON.parse(process.env.ISSUE_FORM_JSON)
    const owner = context.repo.owner;
    const name = issueForm["repository-name"].text
    const description = issueForm["repository-description"].text
    const visibility = issueForm["repository-visibility"].text.toLowerCase()
    const justification = issueForm["repository-justification"].text
    const access = issueForm["repository-access"].text

    core.setOutput('repository-owner', owner)
    core.setOutput('repository-name', name)
    core.setOutput('repository-description', description)
    core.setOutput('repository-visibility', visibility)
    core.setOutput('repository-justification', justification)
    core.setOutput('repository-access', access)

    const errors = []

    // Ensure repository does not exist
    try {
        const response = await github.rest.repos.get({
            owner: owner,
            repo: name,
        })

        errors.push(`Please update **Repository name** as ${owner}/${name} already exists`)
    } catch (error) {
        if (error.status !== 404) {
            errors.push(`Issue arove checking if ${owner}/${name} already exists; please review workflow logs.`)
        }
    }

    // Ensure justification is provided if non-internal visibility is selected
    if (visibility != 'internal' && justification == '*No response*') {
        errors.push(`Please update **Repository justification** regarding the need for \`${visibility}\` visibility`)
    }

    if (errors.length) {
        core.setFailed(`${errors.length} errors were found in validating inputs; please follow up as appropriately.`)
    }

    core.setOutput('errors', errors)
}
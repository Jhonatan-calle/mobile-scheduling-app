# Versioning and Tagging Convention

This project follows **[Semantic Versioning 2.0.0](https://semver.org/)** (SemVer) for version management.

## Semantic Versioning

### Version Format

```
v{MAJOR}.{MINOR}.{PATCH}
```

### Version Components

Given a version number `MAJOR.MINOR.PATCH`, increment the:

1. **MAJOR** version when you make incompatible API changes or breaking changes
2. **MINOR** version when you add functionality in a backward compatible manner
3. **PATCH** version when you make backward compatible bug fixes

### Pre-release Versions

Development and pre-release versions use the `0.x.x` range:

- **0.y.z**:  Initial development phase (anything may change)
- **1.0.0**: First stable public release
- **1.x.x**: Stable versions with backward compatibility guarantees

## Tagging Strategy

### Development Phase (Pre-1.0.0)

During initial development, use `0.x.x` versions:

```bash
v0.1.0    # Initial UI implementation
v0.2.0    # Database integration added
v0.3.0    # API endpoints implemented
v0.4.0    # Authentication added
# ... continue incrementing minor version for each significant feature
```

**Guidelines for 0.x.x versions:**
- Increment MINOR (0.x.0) for new features or major changes
- Increment PATCH (0.x.y) for bug fixes and small improvements
- Breaking changes are acceptable during this phase

### Stable Releases (1.0.0+)

Once the project reaches production readiness: 

```bash
v1.0.0    # First stable release
v1.1.0    # New features added (backward compatible)
v1.1.1    # Bug fixes
v1.2.0    # More new features
v2.0.0    # Breaking changes or major rewrite
```

**Guidelines for 1.x.x+ versions:**
- MAJOR:  Breaking changes, API incompatibilities
- MINOR: New features, backward compatible
- PATCH: Bug fixes only, backward compatible

### Pre-release Tags (Optional)

For versions in testing before official release:

```bash
v1.0.0-alpha.1    # Early internal testing
v1.0.0-alpha.2    # Second alpha iteration
v1.0.0-beta.1     # Feature-complete, ready for testing
v1.0.0-beta.2     # Beta with fixes
v1.0.0-rc.1       # Release candidate
v1.0.0            # Final stable release
```

## Creating Tags

### Annotated Tags (Required)

Always use annotated tags with descriptive messages:

```bash
# Tag the current commit
git tag -a v0.1.0 -m "Initial UI implementation

- All main views completed
- Navigation system functional
- Responsive design implemented
"

# Tag a specific commit
git tag -a v0.1.0 <commit-hash> -m "Description"

# Push tag to remote
git push origin v0.1.0

# Push all tags
git push origin --tags
```

### Tag Message Format

Follow this structure for tag messages:

```bash
git tag -a v0.2.0 -m "Add database integration

Added: 
- SQLite database setup
- User model and repository pattern
- Database migrations system

Changed:
- Updated configuration for database connection

Fixed:
- Memory leak in data persistence layer
"
```

## Working with Tags

### Listing Tags

```bash
# List all tags
git tag

# List tags with messages
git tag -n

# List tags matching pattern
git tag -l "v0.*"
git tag -l "v1.*"

# Show detailed tag information
git show v0.1.0
```

### Checking Out Tags

```bash
# View code at a specific version
git checkout v0.1.0

# Create a branch from a tag
git checkout -b hotfix/v0.1.1 v0.1.0

# Return to latest commit
git checkout main
```

### Deleting Tags (Use with Caution)

```bash
# Delete local tag
git tag -d v0.1.0

# Delete remote tag
git push origin : refs/tags/v0.1.0
```

```markdown

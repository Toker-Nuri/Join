function getAvatarClass(name) {
    const colors = [
        'profile-badge-red', 'profile-badge-blue', 'profile-badge-green',
        'profile-badge-purple', 'profile-badge-orange', 'profile-badge-pink', 'profile-badge-teal'
    ];
    const index = name.length % colors.length;
    return colors[index];
};

function getInitials(name) {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else {
        return words[0].substring(0, 2).toUpperCase();
    }
};

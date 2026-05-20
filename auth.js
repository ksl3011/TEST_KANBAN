const AuthKanban = (() => {
  // double-hash 버그 방지: hash 제외한 현재 URL을 redirectTo로 사용
  const redirectTo = location.origin + location.pathname;

  async function signInWithGoogle() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) alert('Google 로그인 실패: ' + error.message);
  }

  async function signInWithGitHub() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo },
    });
    if (error) alert('GitHub 로그인 실패: ' + error.message);
  }

  async function signOut() {
    await supabaseClient.auth.signOut();
    window.location.reload();
  }

  function onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange(callback);
  }

  return { signInWithGoogle, signInWithGitHub, signOut, onAuthStateChange };
})();

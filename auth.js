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

  async function signInWithEmail(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert('로그인 실패: ' + error.message);
  }

  async function signUpWithEmail(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) { alert('회원가입 실패: ' + error.message); return; }
    if (data.user && !data.session) {
      alert('인증 이메일을 발송했습니다. 메일함을 확인하고 링크를 클릭한 후 로그인해 주세요.');
    }
  }

  return { signInWithGoogle, signInWithGitHub, signInWithEmail, signUpWithEmail, signOut, onAuthStateChange };
})();

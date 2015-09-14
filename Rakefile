#######################
# Working with Jekyll #
#######################
desc "Start Jekyll Server"
task :server do
  puts "## Generating Jekyll site and watching for changes."
  sh "bundle exec jekyll serve"
end

desc "Wactching your LESS files."
task :less do
  puts "## Wactching your LESS files."
  sh "gulp watch"
end

desc "Generate jekyll site and compiling LESS."
task :generate do
  puts "## Generating your Jekyll site."
  system "gulp less"
  system "bundle exec jekyll clean"
  system "bundle exec jekyll build --trace"

end

desc "Getting all the files ready for production. Such as minifying JS, HTML and css..."
task :production do
  puts "## Getting files ready for production. Minifying JS, HTML and css..."
  system "gulp less"
  system "bundle exec jekyll clean"
  system "bundle exec jekyll build --trace"
  system "gulp minify-html"
  system "gulp scripts"
  system "gulp mini-search"
  system "gulp cleanjs"

end

task :watch  do
  puts "Starting to watch source with Jekyll and LESS."
  system "bundle exec jekyll clean"
  system "gulp"
  jekyllPid = Process.spawn("bundle exec jekyll serve")
  lessPid = Process.spawn("gulp watch")

  trap("INT") {
    [jekyllPid, lessPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
    exit 0
  }

  [jekyllPid, lessPid].each { |pid| Process.wait(pid) }
end

task :build  do
  puts "Removing _site and rebuilding."
  system "bundle exec jekyll clean"
  system "gulp"
  jekyllPid = Process.spawn("bundle exec jekyll build --watch")
  system "gulp scripts"
  lessPid = Process.spawn("gulp watch")

  trap("INT") {
    [jekyllPid, lessPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
    exit 0
  }

  [jekyllPid, lessPid].each { |pid| Process.wait(pid) }
end

task :clean  do
  puts "Removing _site ..."
  system "bundle exec jekyll clean"
end